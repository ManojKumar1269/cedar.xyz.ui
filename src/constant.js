import moment from "moment";

export const API_URL = 'https://ceadar-chat-api.azurewebsites.net';

export const isExpired = (access_token_expires) => {
  let newDateObj = new Date(access_token_expires) < moment(new Date()).subtract(60, 'm').toDate();
  return newDateObj
}
