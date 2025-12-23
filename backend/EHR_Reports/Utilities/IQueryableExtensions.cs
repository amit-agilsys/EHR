using System.Linq.Expressions;

namespace EHR_Reports.Utilities
{
    public static class IQueryableExtensions
    {
        public static IQueryable<T> OrderByDynamic<T>(this IQueryable<T> query, string propertyName, bool ascending)
        {
            if (string.IsNullOrWhiteSpace(propertyName))
                return query;

            var parameter = Expression.Parameter(typeof(T), "x");
            var property = Expression.PropertyOrField(parameter, propertyName);
            var lambda = Expression.Lambda(property, parameter);

            string method = ascending ? "OrderBy" : "OrderByDescending";

            return typeof(Queryable).GetMethods()
                .First(m => m.Name == method && m.GetParameters().Length == 2)
                .MakeGenericMethod(typeof(T), property.Type)
                .Invoke(null, new object[] { query, lambda }) as IQueryable<T>;
        }
    }
}
