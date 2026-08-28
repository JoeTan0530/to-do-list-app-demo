import { apiCaller } from "../general.js";

const getTodoApiUrl = () => {
  return process.env.NEXT_PUBLIC_APP_QUERY_URL;
};

export const getTaskStatus = (callback) => {
  const params = {
    url: getTodoApiUrl(),
    urlParams: {
      command: "getTaskStatus",
    },
  };

  apiCaller("POST", params, callback);
};

export const getTaskCategory = (callback) => {
  const params = {
    url: getTodoApiUrl(),
    urlParams: {
      command: "getTaskCategory",
    },
  };

  apiCaller("POST", params, callback);
};

export const addTask = (payload, callback) => {
  const params = {
    url: getTodoApiUrl(),
    urlParams: {
      command: "addTask",
      params: payload,
    },
  };

  apiCaller("POST", params, callback);
};
