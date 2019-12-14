const {promisify} = require('util');
const graph = require('fbgraph');
const GitHub = require('@octokit/rest');
const Twit = require('twit');
const stripe = require('stripe')(process.env.STRIPE_SKEY);
const paypal = require('paypal-rest-sdk');
const ig = require('instagram-node').instagram();
const {google} = require('googleapis');
const Logger = require('./logger');
const geoip = require('geoip-lite');

/**
 * GET /api/facebook
 * Facebook API example.
 */
exports.getFacebook = (req, res, next) => {
  const token = req.user.tokens.find((token) => token.kind === 'facebook');
  graph.setAccessToken(token.accessToken);
  graph.get(`${req.user.facebook}?fields=id,name,email,first_name,last_name,gender,link,locale,timezone`, (err, profile) => {
    if (err) {
      return next(err);
    }
    res.render('api/facebook', {
      title: 'Facebook API',
      profile,
    });
  });
};


/**
 * GET /api/github
 * GitHub API Example.
 */
exports.getGithub = async (req, res, next) => {
  const github = new GitHub();
  try {
    const {data: repo} = await github.repos.get({owner: 'sahat', repo: 'hackathon-starter'});
    res.render('api/github', {
      title: 'GitHub API',
      repo,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * GET /api/twitter
 * Twitter API example.
 */
exports.getTwitter = async (req, res, next) => {
  const token = req.user.tokens.find((token) => token.kind === 'twitter');
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: token.accessToken,
    access_token_secret: token.tokenSecret,
  });
  try {
    const {data: {statuses: tweets}} = await T.get('search/tweets', {
      q: 'nodejs since:2013-01-01',
      geocode: '40.71448,-74.00598,5mi',
      count: 10,
    });
    res.render('api/twitter', {
      title: 'Twitter API',
      tweets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/twitter
 * Post a tweet.
 */
exports.postTwitter = (req, res, next) => {
  req.assert('tweet', 'Tweet cannot be empty').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/api/twitter');
  }

  const token = req.user.tokens.find((token) => token.kind === 'twitter');
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: token.accessToken,
    access_token_secret: token.tokenSecret,
  });
  T.post('statuses/update', {status: req.body.tweet}, (err) => {
    if (err) {
      return next(err);
    }
    req.flash('success', {msg: 'Your tweet has been posted.'});
    res.redirect('/api/twitter');
  });
};

/**
 * GET /api/stripe
 * Stripe API example.
 */
exports.getStripe = (req, res) => {
  res.render('api/stripe', {
    title: 'Stripe API',
    publishableKey: process.env.STRIPE_PKEY,
  });
};

/**
 * POST /api/stripe
 * Make a payment.
 */
exports.postStripe = (req, res) => {
  const {stripeToken, stripeEmail} = req.body;
  stripe.charges.create({
    amount: 395,
    currency: 'usd',
    source: stripeToken,
    description: stripeEmail,
  }, (err) => {
    if (err && err.type === 'StripeCardError') {
      req.flash('errors', {msg: 'Your card has been declined.'});
      return res.redirect('/api/stripe');
    }
    req.flash('success', {msg: 'Your card has been successfully charged.'});
    res.redirect('/api/stripe');
  });
};

/**
 * GET /api/instagram
 * Instagram API example.
 */
exports.getInstagram = async (req, res, next) => {
  const token = req.user.tokens.find((token) => token.kind === 'instagram');
  ig.use({client_id: process.env.INSTAGRAM_ID, client_secret: process.env.INSTAGRAM_SECRET});
  ig.use({access_token: token.accessToken});
  try {
    const userSelfMediaRecentAsync = promisify(ig.user_self_media_recent);
    const myRecentMedia = await userSelfMediaRecentAsync();
    res.render('api/instagram', {
      title: 'Instagram API',
      myRecentMedia,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/paypal
 * PayPal SDK example.
 */
exports.getPayPal = (req, res, next) => {
  paypal.configure({
    mode: 'sandbox',
    client_id: process.env.PAYPAL_ID,
    client_secret: process.env.PAYPAL_SECRET,
  });

  const paymentDetails = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: process.env.PAYPAL_RETURN_URL,
      cancel_url: process.env.PAYPAL_CANCEL_URL,
    },
    transactions: [{
      description: 'Hackathon Starter',
      amount: {
        currency: 'USD',
        total: '1.99',
      },
    }],
  };

  paypal.payment.create(paymentDetails, (err, payment) => {
    if (err) {
      return next(err);
    }
    const {links, id} = payment;
    req.session.paymentId = id;
    for (let i = 0; i < links.length; i++) {
      if (links[i].rel === 'approval_url') {
        res.render('api/paypal', {
          approvalUrl: links[i].href,
        });
      }
    }
  });
};

/**
 * GET /api/paypal/success
 * PayPal SDK example.
 */
exports.getPayPalSuccess = (req, res) => {
  const {paymentId} = req.session;
  const paymentDetails = {payer_id: req.query.PayerID};
  paypal.payment.execute(paymentId, paymentDetails, (err) => {
    res.render('api/paypal', {
      result: true,
      success: !err,
    });
  });
};

/**
 * GET /api/paypal/cancel
 * PayPal SDK example.
 */
exports.getPayPalCancel = (req, res) => {
  req.session.paymentId = null;
  res.render('api/paypal', {
    result: true,
    canceled: true,
  });
};


exports.getHereMaps = (req, res) => {
  const imageMapURL = `https://image.maps.api.here.com/mia/1.6/mapview?\
app_id=${process.env.HERE_APP_ID}&app_code=${process.env.HERE_APP_CODE}&\
poix0=47.6516216,-122.3498897;white;black;15;Fremont Troll&\
poix1=47.6123335,-122.3314332;white;black;15;Seattle Art Museum&\
poix2=47.6162956,-122.3555097;white;black;15;Olympic Sculpture Park&\
poix3=47.6205099,-122.3514661;white;black;15;Space Needle&\
c=47.6176371,-122.3344637&\
u=1500&\
vt=1&&z=13&\
h=500&w=800&`;

  res.render('api/here-maps', {
    app_id: process.env.HERE_APP_ID,
    app_code: process.env.HERE_APP_CODE,
    title: 'Here Maps API',
    imageMapURL,
  });
};

exports.getGoogleMaps = (req, res) => {
  res.render('api/google-maps', {
    title: 'Google Maps API',
    google_map_api_key: process.env.GOOGLE_MAP_API_KEY,
  });
};

exports.getGoogleDrive = (req, res) => {
  const token = req.user.tokens.find((token) => token.kind === 'google');
  const authObj = new google.auth.OAuth2({
    access_type: 'offline',
  });
  authObj.setCredentials({
    access_token: token.accessToken,
  });

  const drive = google.drive({
    version: 'v3',
    auth: authObj,
  });

  drive.files.list({
    fields: 'files(iconLink, webViewLink, name)',
  }, (err, response) => {
    if (err) return Logger.logError(`The API returned an error: ${err}`);
    res.render('api/google-drive', {
      title: 'Google Drive API',
      files: response.data.files,
    });
  });
};

exports.getGoogleSheets = (req, res) => {
  const token = req.user.tokens.find((token) => token.kind === 'google');
  const authObj = new google.auth.OAuth2({
    access_type: 'offline',
  });
  authObj.setCredentials({
    access_token: token.accessToken,
  });

  const sheets = google.sheets({
    version: 'v4',
    auth: authObj,
  });

  const url = 'https://docs.google.com/spreadsheets/d/12gm6fRAp0bC8TB2vh7sSPT3V75Ug99JaA9L0PqiWS2s/edit#gid=0';
  const re = /spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const id = url.match(re)[1];

  sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range: 'Class Data!A1:F',
  }, (err, response) => {
    if (err) return Logger.logError(`The API returned an error: ${err}`);
    res.render('api/google-sheets', {
      title: 'Google Sheets API',
      values: response.data.values,
    });
  });
};

exports.getLocation = (ip) => {
  const re = /\b(?!(10)|192\.168|172\.(2[0-9]|1[6-9]|3[0-1])|(25[6-9]|2[6-9][0-9]|[3-9][0-9][0-9]|99[1-9]))[0-9]{1,3}\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/;
  if (re.test(ip)) return geoip.lookup(ip).country;
  return null;
};
