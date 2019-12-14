
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongooseHelper = require('../models/MongooseHelper');
const Admins= MongooseHelper.getModel('AdminModel');
const Companies= MongooseHelper.getModel('CompanyModel');
const DevResponse = require('../models/classes/DevResponse');
const ValidationStatus = require('../controllers/developercontroller').RegisterDeveloperStatus;
const {AdminController} = require('../controllers/admincontroller');
const {AdminPersister} = require('../controllers/persistence/adminpersister');
const APIStatus = require('../models/classes/DevResponse').APIStatus;
const refresh = require('passport-oauth2-refresh');
const {Strategy: InstagramStrategy} = require('passport-instagram');
const {Strategy: FacebookStrategy} = require('passport-facebook');
const {Strategy: TwitterStrategy} = require('passport-twitter');
const {Strategy: GitHubStrategy} = require('passport-github');
const {OAuth2Strategy: GoogleStrategy} = require('passport-google-oauth');
const {Strategy: LinkedInStrategy} = require('passport-linkedin-oauth2');
require('../models/Developer');
const DeveloperModel = require('../models/MongooseHelper').getModel('DeveloperModel');
const _ = require('lodash');
const moment = require('moment');

passport.use('developer-username-local', new LocalStrategy((username, password, done) => {
  DeveloperModel.findOne({username: username})
      .then((developer) => {
        if (developer) {
          if (developer.validatePassword(password)) {
            return done(null, {status: 'authentication success', developer});
          }
          return done(null, {status: 'authentication failure', developer});
        }
        return done(null, {status: 'not found', developer});
      })
      .catch((message) => {
        return done(null, {status: 'authentication error'});
      });
}));

passport.use('developer-email-local', new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    (email, password, done) => {
      DeveloperModel.findOne({email: email})
          .then((developer) => {
            if (developer && developer.validatePassword(password)) {
              return done(null, {status: 'authentication success', developer});
            }
            return done(null, {status: 'authentication failure', developer});
          })
          .catch((message) => {
            return done(null, {status: 'authentication error'});
          });
    }));

passport.use('Admin-local-username', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
}, (username, password, done) => {
  const Persister=new AdminPersister();
  const controller=new AdminController(Persister);
  controller.validateAdminLogin({username: username, password: password}).then((response) =>{
    if (response.status === APIStatus.Failed) {
      return done(null, [false, response]);
    }
    const user = response.data;
    const usr = new Admins();
    usr._id = user._id;
    usr.username = user.username;
    usr.email = user.email;
    usr.created_on = user.created_on;
    usr.audit_on = user.audit_on;
    usr.isdeactivated = user.isdeactivated;
    usr.Active = user.Active;
    return done(null, [usr, response]);
  }).catch(done);
}));

passport.use('Admin-local-email', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, (email, password, done) => {
  const Persister=new AdminPersister();
  const controller=new AdminController(Persister);
  controller.validateAdminLogin({email: email, password: password}).then((response) =>{
    if (response.status === APIStatus.Failed) {
      return done(null, [false, response]);
    }
    const user = response.data;
    const usr = new Admins();
    usr._id = user._id;
    usr.username = user.username;
    usr.email = user.email;
    usr.created_on = user.created_on;
    usr.audit_on = user.audit_on;
    usr.isdeactivated = user.isdeactivated;
    usr.Active = user.Active;
    return done(null, [usr, response]);
  }).catch(done);
}));
passport.use('Company-local', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
}, (username, password, done) => {
  Companies.findOne({
    username,
  }).then((user) => {
    if (!user || !user.validatePassword(password)) {
      return done(null, false, {
        errors: {
          'username or password': 'is invalid',
        },
      });
    }

    const usr = new Companies();
    usr._id = user._id;
    usr.username = user.username;
    usr.email = user.email;
    usr.phone = user.phone;
    usr.created_on = user.created_on;
    usr.audit_on = user.audit_on;
    usr.isdeactivated = user.isdeactivated;
    usr.salt = user.salt;
    return done(null, usr);
  }).catch(done);
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Admins.findById(id).then((user) => {
    if (user) {
      done(null, user);
    } else {
      Companies.findById(id).then((user) => {
        if (user) {
          done(null, user);
        }
      });
    }
  });
});

// /**
//  * Sign in with Facebook.
//  */
// passport.use(new FacebookStrategy({
//   clientID: process.env.FACEBOOK_ID,
//   clientSecret: process.env.FACEBOOK_SECRET,
//   callbackURL: `${process.env.BASE_URL}/developer/auth/facebook/callback`,
//   passReqToCallback: true,
//   enableProof: true,
// },
// function(accessToken, refreshToken, profile, done) {
//   const response = new DevResponse();
//   DeveloperModel.findOne({facebookId: profile.id}, function(err, user) {
//     if (err) {
//       return done(err);
//     }
//     if (!user) {
//       response.fillResponse(APIStatus.Failed, 'No User linked to this Facebook Id');
//       return done(null, response);
//     }
//     response.fillResponse(APIStatus.Successful, ValidationStatus.ValidationStatus.SUCCESSFUL, user);
//     return done(err, response);
//   });
// }));


passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: `${process.env.BASE_URL}/developer/auth/facebook/callback`,
  profileFields: ['name', 'email', 'link', 'locale', 'timezone', 'gender'],
  passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    DeveloperModel.findOne({facebook: profile.id}, (err, existingUser) => {
      if (err) {
        return done(err);
      }
      if (existingUser) {
        req.flash('errors', {msg: 'There is already a Facebook account that belongs to you. Please Sign in with that account .'});
        done(err);
      } else {
        DeveloperModel.findById(req.user.id, (err, user) => {
          if (err) {
            return done(err);
          }
          user.facebook = profile.id;
          user.tokens.push({kind: 'facebook', accessToken});
          user.profile.name = user.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
          user.save((err) => {
            req.flash('info', {msg: 'Facebook account has been linked.'});
            done(err, user);
          });
        });
      }
    });
  } else {
    DeveloperModel.findOne({facebook: profile.id}, (err, existingUser) => {
      if (err) {
        return done(err);
      }
      if (existingUser) {
        return done(null, existingUser);
      }
      DeveloperModel.findOne({email: profile._json.email}, (err, existingEmailUser) => {
        if (err) {
          return done(err);
        }
        if (existingEmailUser) {
          req.flash('errors', {msg: 'There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.'});
          done(err);
        } else {
          const user = new DeveloperModel();
          user.email = profile._json.email;
          user.facebook = profile.id;
          user.tokens.push({kind: 'facebook', accessToken});
          user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
          user.profile.gender = profile._json.gender;
          user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
          user.profile.location = (profile._json.location) ? profile._json.location.name : '';
          user.save((err) => {
            done(err, user);
          });
        }
      });
    });
  }
}));

/**
 * Sign in with GitHub.
 */
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_ID,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: `${process.env.BASE_URL}/auth/github/callback`,
  passReqToCallback: true,
  scope: ['user:email'],
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    Admins.findOne({github: profile.id}, (err, existingUser) => {
      if (existingUser) {
        req.flash('errors', {msg: 'There is already a GitHub account that belongs to you. Sign in with that account or delete it, then link it with your current account.'});
        done(err);
      } else {
        Admins.findById(req.user.id, (err, user) => {
          if (err) {
            return done(err);
          }
          user.github = profile.id;
          user.tokens.push({kind: 'github', accessToken});
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.picture = user.profile.picture || profile._json.avatar_url;
          user.profile.location = user.profile.location || profile._json.location;
          user.profile.website = user.profile.website || profile._json.blog;
          user.save((err) => {
            req.flash('info', {msg: 'GitHub account has been linked.'});
            done(err, user);
          });
        });
      }
    });
  } else {
    Admins.findOne({github: profile.id}, (err, existingUser) => {
      if (err) {
        return done(err);
      }
      if (existingUser) {
        return done(null, existingUser);
      }
      Admins.findOne({email: profile._json.email}, (err, existingEmailUser) => {
        if (err) {
          return done(err);
        }
        if (existingEmailUser) {
          req.flash('errors', {msg: 'There is already an account using this email address. Sign in to that account and link it with GitHub manually from Account Settings.'});
          done(err);
        } else {
          const user = new Admins();
          user.email = _.get(_.orderBy(profile.emails, ['primary', 'verified'], ['desc', 'desc']), [0, 'value'], null);
          user.github = profile.id;
          user.tokens.push({kind: 'github', accessToken});
          user.profile.name = profile.displayName;
          user.profile.picture = profile._json.avatar_url;
          user.profile.location = profile._json.location;
          user.profile.website = profile._json.blog;
          user.save((err) => {
            done(err, user);
          });
        }
      });
    });
  }
}));

/**
 * Sign in with Twitter.
 */
passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callbackURL: `${process.env.BASE_URL}/auth/twitter/callback`,
  passReqToCallback: true,
}, (req, accessToken, tokenSecret, profile, done) => {
  if (req.user) {
    Admins.findOne({twitter: profile.id}, (err, existingUser) => {
      if (err) {
        return done(err);
      }
      if (existingUser) {
        req.flash('errors', {msg: 'There is already a Twitter account that belongs to you. Sign in with that account or delete it, then link it with your current account.'});
        done(err);
      } else {
        Admins.findById(req.user.id, (err, user) => {
          if (err) {
            return done(err);
          }
          user.twitter = profile.id;
          user.tokens.push({kind: 'twitter', accessToken, tokenSecret});
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.location = user.profile.location || profile._json.location;
          user.profile.picture = user.profile.picture || profile._json.profile_image_url_https;
          user.save((err) => {
            if (err) {
              return done(err);
            }
            req.flash('info', {msg: 'Twitter account has been linked.'});
            done(err, user);
          });
        });
      }
    });
  } else {
    Admins.findOne({twitter: profile.id}, (err, existingUser) => {
      if (err) {
        return done(err);
      }
      if (existingUser) {
        return done(null, existingUser);
      }
      const user = new Admins();
      // Twitter will not provide an email address.  Period.
      // But a person’s twitter username is guaranteed to be unique
      // so we can "fake" a twitter email address as follows:
      user.email = `${profile.username}@twitter.com`;
      user.twitter = profile.id;
      user.tokens.push({kind: 'twitter', accessToken, tokenSecret});
      user.profile.name = profile.displayName;
      user.profile.location = profile._json.location;
      user.profile.picture = profile._json.profile_image_url_https;
      user.save((err) => {
        done(err, user);
      });
    });
  }
}));

/**
 * Sign in with Google.
 */
const googleStrategyConfig = new GoogleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: '/auth/google/callback',
  passReqToCallback: true,
}, (req, accessToken, refreshToken, params, profile, done) => {
  if (req.user) {
    Admins.findOne({google: profile.id}, (err, existingUser) => {
      if (err) {
        return done(err);
      }
      if (existingUser && (existingUser.id !== req.user.id)) {
        req.flash('errors', {msg: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.'});
        done(err);
      } else {
        Admins.findById(req.user.id, (err, user) => {
          if (err) {
            return done(err);
          }
          user.google = profile.id;
          user.tokens.push({
            kind: 'google',
            accessToken,
            accessTokenExpires: moment().add(params.expires_in, 'seconds').format(),
            refreshToken,
          });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.picture = user.profile.picture || profile._json.picture;
          user.save((err) => {
            req.flash('info', {msg: 'Google account has been linked.'});
            done(err, user);
          });
        });
      }
    });
  } else {
    Admins.findOne({google: profile.id}, (err, existingUser) => {
      if (err) {
        return done(err);
      }
      if (existingUser) {
        return done(null, existingUser);
      }
      Admins.findOne({email: profile.emails[0].value}, (err, existingEmailUser) => {
        if (err) {
          return done(err);
        }
        if (existingEmailUser) {
          req.flash('errors', {msg: 'There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.'});
          done(err);
        } else {
          const user = new Admins();
          user.email = profile.emails[0].value;
          user.google = profile.id;
          user.tokens.push({
            kind: 'google',
            accessToken,
            accessTokenExpires: moment().add(params.expires_in, 'seconds').format(),
            refreshToken,
          });
          user.profile.name = profile.displayName;
          user.profile.gender = profile._json.gender;
          user.profile.picture = profile._json.picture;
          user.save((err) => {
            done(err, user);
          });
        }
      });
    });
  }
});
passport.use('google', googleStrategyConfig);
refresh.use('google', googleStrategyConfig);

/**
 * Sign in with LinkedIn.
 */
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_ID,
  clientSecret: process.env.LINKEDIN_SECRET,
  callbackURL: `${process.env.BASE_URL}/auth/linkedin/callback`,
  scope: ['r_liteprofile', 'r_emailaddress'],
  passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    Admins.findOne({linkedin: profile.id}, (err, existingUser) => {
      if (err) {
        return done(err);
      }
      if (existingUser) {
        req.flash('errors', {msg: 'There is already a LinkedIn account that belongs to you. Sign in with that account or delete it, then link it with your current account.'});
        done(err);
      } else {
        Admins.findById(req.user.id, (err, user) => {
          if (err) {
            return done(err);
          }
          user.linkedin = profile.id;
          user.tokens.push({kind: 'linkedin', accessToken});
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.picture = user.profile.picture || profile.photos[3].value;
          user.save((err) => {
            if (err) {
              return done(err);
            }
            req.flash('info', {msg: 'LinkedIn account has been linked.'});
            done(err, user);
          });
        });
      }
    });
  } else {
    Admins.findOne({linkedin: profile.id}, (err, existingUser) => {
      if (err) {
        return done(err);
      }
      if (existingUser) {
        return done(null, existingUser);
      }
      Admins.findOne({email: profile.emails[0].value}, (err, existingEmailUser) => {
        if (err) {
          return done(err);
        }
        if (existingEmailUser) {
          req.flash('errors', {msg: 'There is already an account using this email address. Sign in to that account and link it with LinkedIn manually from Account Settings.'});
          done(err);
        } else {
          const user = new Admins();
          user.linkedin = profile.id;
          user.tokens.push({kind: 'linkedin', accessToken});
          user.email = profile.emails[0].value;
          user.profile.name = profile.displayName;
          user.profile.picture = user.profile.picture || profile.photos[3].value;
          user.save((err) => {
            done(err, user);
          });
        }
      });
    });
  }
}));

/**
 * Sign in with Instagram.
 */
passport.use(new InstagramStrategy({
  clientID: process.env.INSTAGRAM_ID,
  clientSecret: process.env.INSTAGRAM_SECRET,
  callbackURL: '/auth/instagram/callback',
  passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    Admins.findOne({instagram: profile.id}, (err, existingUser) => {
      if (err) {
        return done(err);
      }
      if (existingUser) {
        req.flash('errors', {msg: 'There is already an Instagram account that belongs to you. Sign in with that account or delete it, then link it with your current account.'});
        done(err);
      } else {
        Admins.findById(req.user.id, (err, user) => {
          if (err) {
            return done(err);
          }
          user.instagram = profile.id;
          user.tokens.push({kind: 'instagram', accessToken});
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.picture = user.profile.picture || profile._json.data.profile_picture;
          user.profile.website = user.profile.website || profile._json.data.website;
          user.save((err) => {
            req.flash('info', {msg: 'Instagram account has been linked.'});
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({instagram: profile.id}, (err, existingUser) => {
      if (err) {
        return done(err);
      }
      if (existingUser) {
        return done(null, existingUser);
      }
      const user = new Admins();
      user.instagram = profile.id;
      user.tokens.push({kind: 'instagram', accessToken});
      user.profile.name = profile.displayName;
      // Similar to Twitter API, assigns a temporary e-mail address
      // to get on with the registration process. It can be changed later
      // to a valid e-mail address in Profile Management.
      user.email = `${profile.username}@instagram.com`;
      user.profile.website = profile._json.data.website;
      user.profile.picture = profile._json.data.profile_picture;
      user.save((err) => {
        done(err, user);
      });
    });
  }
}));

module.exports = passport;
