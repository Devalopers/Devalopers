const mongoose =require( 'mongoose');
const env=require('../../src/env');
import 'regenerator-runtime/runtime';


describe('...', () => {
  beforeAll(async () => {
    mongoose.connect(env.env.app.testdburl, {
      useNewUrlParser: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('...', async () => {
    const User = mongoose.model('User', new mongoose.Schema({name: String}));
    const cnt = await User.count();
    expect(cnt).toEqual(0);
  });
  
});
