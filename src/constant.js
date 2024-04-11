import moment from "moment";

export const API_URL = 'http://localhost:8000';

export const isExpired = (access_token_expires) => {
  let newDateObj = new Date(access_token_expires) < moment(new Date()).subtract(60, 'm').toDate();
  return newDateObj
}