export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

export interface AxiosError {
  response?: {
    data: {
      message: string;
    };
  };
}

// export type APIErrorResponse = {
//   code: string;
//   config: object;
//   message: string;
//   name: string;
//   request: object;
//   response: {
//     config: object;
//     data: {
//       code: number;
//       message: string;
//       success: boolean;
//     };
//   };
// };
