
import {createSchema, registerModel} from './MongooseHelper.js';
const SubscriberSchema = createSchema({

  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  SearchCriteria: Object,

  UnsubscriptionKey: String,

  isdeactivated: {
    type: Boolean,
    default: false,
  },

}, {
  timestamps: true, capped: process.env.MAXDBFETCH,
});

export default registerModel('SubscriberModel', SubscriberSchema);
