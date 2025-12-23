using EHR_Reports.Configuration;
using EHR_Reports.Data;
using EHR_Reports.Interfaces;
using EHR_Reports.Models;
using EHR_Reports.Models.Role;
using EHR_Reports.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;   
})
.AddJwtBearer(options =>
{
    var key = Encoding.UTF8.GetBytes(builder.Configuration["JWTSettings:Key"]);
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JWTSettings:Issuer"],
        ValidAudience = builder.Configuration["JWTSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
})
.AddCookie("CustomCookie", options =>
{
    options.LoginPath = "/account/login";
    options.AccessDeniedPath = "/account/unauthorized";
});

builder.Services.AddAuthorization(options =>
{
    var defaultAuthorizationPolicyBuilder = new AuthorizationPolicyBuilder(
        JwtBearerDefaults.AuthenticationScheme);
    defaultAuthorizationPolicyBuilder = defaultAuthorizationPolicyBuilder.RequireAuthenticatedUser();
    options.DefaultPolicy = defaultAuthorizationPolicyBuilder.Build();
});

// Add Identity services
builder.Services.AddIdentity<User, ApplicationRole>(options =>
{
    options.Password.RequiredLength = 6;
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;

    // for email confirmation
    options.SignIn.RequireConfirmedEmail = true;

})
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();
//    .AddRoles<ApplicationRole>() // be able to add roles
//    .AddRoleManager<RoleManager<ApplicationRole>>() // be able to make use of RoleManager
//    .AddEntityFrameworkStores<ApplicationDbContext>() // providing our context
//    .AddSignInManager<SignInManager<User>>() // make use of Signin manager
//    .AddUserManager<UserManager<User>>() // make use of UserManager to create users
//    .AddDefaultTokenProviders(); // be able to create tokens for email confirmation
//builder.Services.AddDataProtection();

//builder.Services.AddIdentity<User, ApplicationRole>()
//    .AddEntityFrameworkStores<ApplicationDbContext>()
//    .AddDefaultTokenProviders();


builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IViewRenderService, ViewRenderService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IJWTService, JWTService>();
builder.Services.AddScoped<ContextSeedService>();
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IInsuranceService, InsuranceService>();
builder.Services.AddScoped<IFinancialClassService, FinancialClassService>();
builder.Services.AddScoped<IPatientTypeService, PatientTypeService>();
builder.Services.AddScoped<IDischargeStatusService, DischargeStatusService>();
builder.Services.AddScoped<IRoomTypeService, RoomTypeService>();
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IReportsService, ReportsService>();
builder.Services.AddScoped<IScreenService, ScreenService>();



builder.Services.AddHttpContextAccessor();

builder.Services.Configure<SmtpSettings>(
    builder.Configuration.GetSection(nameof(SmtpSettings)));

builder.Services.Configure<JWTSettings>(builder.Configuration.GetSection(nameof(JWTSettings)));
builder.Services.AddControllersWithViews()
    .AddJsonOptions(options =>

    {

        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;

        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;

        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;

        options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;

        options.JsonSerializerOptions.WriteIndented = true;

    }); ;

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "EHR Reports API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter your JWT token"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

var app = builder.Build();

#region ContextSeed
using var scope = app.Services.CreateScope();
try
{
    var contextSeedService = scope.ServiceProvider.GetService<ContextSeedService>();
    await contextSeedService!.InitializeContextAsync();
}
catch (Exception ex)
{
    var logger = scope.ServiceProvider.GetService<ILogger<Program>>();
    logger!.LogError(ex.Message, "Failed to initialize and seed the database");
}
#endregion

var jwtSettings = app.Services.GetRequiredService<IOptions<JWTSettings>>().Value;

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    // Use SwaggerUI middleware, pointing to the generated spec
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "My API v1");
    });
}

app.UseHttpsRedirection();
//app.UseRouting();
// CORS

app.UseCors(policy => policy
    .WithOrigins(jwtSettings.ClientUrl)
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials());

app.UseAuthentication();
app.UseAuthorization();

//app.UseMiddleware<JwtValidationMiddleware>();
app.MapControllers();

app.Run();
