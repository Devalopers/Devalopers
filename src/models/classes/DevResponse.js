/* eslint-disable require-jsdoc */
class DevResponse {
  constructor(status, message, data) {
    this.setStatus(status);
    this.setMessage(message);
    this.setData(data);
  }
  fillResponse(status, message, data) {
    this.setStatus(status);
    this.setMessage(message);
    this.setData(data);
  }
  setMessage(message) {
    this.message = message;
  }

  setData(data) {
    this.data = data;
  }

  setStatus(status) {
    this.status = status;
  }

  getMessage() {
    return this.message;
  }

  getData() {
    return this.data;
  }

  getStatus() {
    return this.status;
  }
}
const APIStatus={Failed: 'Failed', Successful: 'Successful'};

module.exports = {
  DevResponse: DevResponse,
  APIStatus: APIStatus,
};
