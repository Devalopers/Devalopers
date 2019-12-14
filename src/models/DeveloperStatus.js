import {createSchema, registerModel} from './MongooseHelper.js';

const DeveloperStatusSchema = createSchema({
  name: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  isDeactivated: {
    type: Boolean,
    default: false,
  },

  auditDate: {
    type: Date,
    default: Date.now,
  },
});

registerModel('DeveloperStatusModel', DeveloperStatusSchema);
