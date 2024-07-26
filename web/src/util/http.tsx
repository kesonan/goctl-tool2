import axios from "axios";

const Paths = {
  ParseBodyPath: "/api/requestbodyparse",
  APIBuildPath: "/api/generate",
  RenderTagPath: "/api/rendertag",
  DBConnectPath: "/api/model-connect",
  TablePath: "/api/model-tables",
  MysqlGenPath: "/api/mysql-generate",
  MysqlDownloadPath: "/api/mysql-download",
};

export type ParseBodyResult = {
  form: ParseBodyForm[];
};

export type APIBuildResult = {
  api: string;
};

export type RenderTagResult = {
  tag: string;
};

export type ConnectResult = {
  schemas: string[];
};

export type TablesResult = {
  tables: string[];
};

export type File = {
  name: string;
  content: string;
};

export type MysqlGenResult = {
  files: File[];
};

export type ParseBodyForm = {
  name: string;
  type: string;
  optional?: boolean;
  defaultValue?: string;
  checkEnum?: boolean;
  enumValue?: string;
  lowerBound?: number;
  upperBound?: number;
};

function postJSON<T>(
  path: string,
  data: {},
  callback: (data: T) => void,
  catchError: (err: string) => void,
): void {
  axios
    .post(path, data)
    .then(function (response) {
      if (response.status === 200) {
        let data = response.data;
        if (data.code === 0) {
          callback(data.data);
        } else {
          catchError(data.msg);
        }
      }
    })
    .catch((err) => {
      console.log(err);
      catchError(err.toString());
    });
}

function download(
  path: string,
  data: {},
  callback: () => void,
  catchError: (err: string) => void,
): void {
  axios({
    method: "post",
    url: path,
    data: data,
    responseType: "blob",
  })
    .then(function (response) {
      if (response.status === 200) {
        const disposition = response.headers["content-disposition"];
        let filename = "downloaded_file";
        if (disposition && disposition.includes("attachment")) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, "");
          }
        }

        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: "application/zip" }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
        callback();
      }
    })
    .catch((err) => {
      console.log(err);
      catchError(err.toString());
    });
}

export const Http = {
  ParseBodyFromJson: (
    json: string,
    callback: (data: ParseBodyForm[]) => void,
    catchError: (err: string) => void,
  ) => {
    postJSON<ParseBodyResult>(
      Paths.ParseBodyPath,
      {
        json: json,
      },
      (data) => {
        callback(data.form);
      },
      catchError,
    );
  },
  Build: (
    param: any,
    callback: (data: string) => void,
    catchError: (err: string) => void,
  ) => {
    postJSON<APIBuildResult>(
      Paths.APIBuildPath,
      param,
      (data) => {
        callback(data.api);
      },
      catchError,
    );
  },
  RenderTag: (
    param: any,
    callback: (data: string) => void,
    catchError: (err: string) => void,
  ) => {
    postJSON<RenderTagResult>(
      Paths.RenderTagPath,
      param,
      (data) => {
        callback(data.tag);
      },
      catchError,
    );
  },
  ConnectDB: (
    param: any,
    callback: (data: string[]) => void,
    catchError: (err: string) => void,
  ) => {
    postJSON<ConnectResult>(
      Paths.DBConnectPath,
      param,
      (data) => {
        callback(data.schemas);
      },
      catchError,
    );
  },
  GetTables: (
    param: any,
    callback: (data: string[]) => void,
    catchError: (err: string) => void,
  ) => {
    postJSON<TablesResult>(
      Paths.TablePath,
      param,
      (data) => {
        callback(data.tables);
      },
      catchError,
    );
  },
  MysqlGen: (
    param: any,
    callback: (data: File[]) => void,
    catchError: (err: string) => void,
  ) => {
    postJSON<MysqlGenResult>(
      Paths.MysqlGenPath,
      param,
      (data) => {
        callback(data.files);
      },
      catchError,
    );
  },
  MysqlDownload: (
    param: any,
    callback: () => void,
    catchError: (err: string) => void,
  ) => {
    download(Paths.MysqlDownloadPath, param, callback, catchError);
  },
};
