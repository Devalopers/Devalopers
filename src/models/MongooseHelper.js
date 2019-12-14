import {Schema, model} from 'mongoose';
import {logInfo} from '../controllers/logger';


/**
 * creates new mongoose schema
 * @param {*} definition the schema definition
 * @param {*} options schema options
 * @return {*} schema
 */
export function createSchema(definition, options) {
  const myschema=new Schema(definition, options);
  myschema.post('init', function(doc) {
    logInfo('%s has been initialized from the db', doc._id);
  });
  myschema.post('validate', function(doc) {
    logInfo('%s has been validated (but not saved yet)', doc._id);
  });
  myschema.post('save', function(doc) {
    logInfo('%s has been saved', doc._id);
  });
  myschema.post('remove', function(doc) {
    logInfo('%s has been removed', doc._id);
  });
  return myschema;
}


/**
 * Register a new schema
 * @param {*} schemaName the name of schema to be saved
 * @param {*} schema the actual constructed schema
 */
export function registerModel(schemaName, schema) {
  model(schemaName, schema);
}


/**
 * get a schema
 * @param {*} schemaName the name of schema to be saved
 * @return {*} schema the actual constructed schema
 */
export function getModel(schemaName) {
  return model(schemaName);
}
