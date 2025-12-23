namespace EHR_Reports.Models
{
    public class ResponseModel<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T Data { get; set; }
        public List<string> Errors { get; set; } = [];
        public static ResponseModel<T> SuccessResult(T data, string message = "Success")
        {
            return new ResponseModel<T> { Success = true, Data = data, Message = message };
        }

        public static ResponseModel<T> Failure(string message)
        {
            return new ResponseModel<T> { Success = false, Message = message };
        }

        public static ResponseModel<T> Failure(List<string> errors)
        {
            return new ResponseModel<T>
            {
                Success = false,
                Errors = errors,
                Message = "One or more errors occurred."
            };
        }
    }
}
