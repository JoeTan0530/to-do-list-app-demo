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

export const addTask = (payload, callback, errorState) => {
  const params = {
    url: getTodoApiUrl(),
    urlParams: {
      command: "addTask",
      params: payload,
    },
  };

  apiCaller("POST", params, callback, errorState);
};

export const editTask = (payload, callback, errorState) => {
  const params = {
    url: getTodoApiUrl(),
    urlParams: {
      command: "editTask",
      params: payload,
    },
  };

  apiCaller("POST", params, callback, errorState);
};


export const getTaskList = (payload, callback) => {
  const params = {
    url: getTodoApiUrl(),
    urlParams: {
      command: "getTaskList",
      params: payload,
    },
  };

  apiCaller("POST", params, callback);
};

export const getDashboardData = (callback) => {
  const params = {
    url: getTodoApiUrl(),
    urlParams: {
      command: "getDashboardData"
    }
  };

  apiCaller("POST", params, callback);
}

export const getTaskItem = (payload, callback) => {
  const params = {
    url: getTodoApiUrl(),
    urlParams: {
      command: "getTaskItem",
      params: payload,
    },
  };

  apiCaller("POST", params, callback);
};


export const importTasks = (payload, callback) => {
  const params = {
    url: getTodoApiUrl(),
    urlParams: {
      command: "importTasks",
      params: payload
    }
  }

  apiCaller("POST", params, callback);
}

export const removeTask = (payload, callback) => {
  const params = {
    url: getTodoApiUrl(),
    urlParams: {
      command: "removeTask",
      params: payload
    }
  }

  apiCaller("POST", params, callback); 
}

export const reorderingTask = (payload, callback) => {
  const params = {
    url: getTodoApiUrl(),
    urlParams: {
      command: "reorderingTask",
      params: payload
    }
  }

  apiCaller("POST", params, callback);
}

export const updateTaskStatus = (payload, callback) => {
  const params = {
    url: getTodoApiUrl(),
    urlParams: {
      command: "updateTaskStatus",
      params: payload
    }
  }

  apiCaller("POST", params, callback);
}