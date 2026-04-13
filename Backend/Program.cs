using Backend.Data;
using Backend.Helpers;
using Backend.Middleware;
using Backend.Repositories.Implementation;
using Backend.Repositories.Interfaces;
using Backend.Services.Implementation;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 2. JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "SUPER_SECRET_KEY_FOR_JWT_TOKEN_MANAGEMENT_SYSTEM_1234567890";
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// 3. Authorization & RBAC Policies
builder.Services.AddAuthorization(options =>
{
    var permissions = new[] { 
        "users.view", "users.create", "users.manage",
        "roles.view", "roles.create", "roles.manage",
        "permissions.view",
        "products.view", "products.create", "products.manage",
        "orders.view", "orders.create", "orders.manage",
        "expenses.view", "expenses.create", "expenses.manage",
        "deliveries.view", "deliveries.create", "deliveries.manage",
        "dashboard.view", "settings.view", "settings.manage",
        "ai.query", "audit-logs.view",
        "attendance.view", "attendance.create", "attendance.manage"
    };

    foreach (var permission in permissions)
    {
        options.AddPolicy(permission, policy => policy.Requirements.Add(new PermissionRequirement(permission)));
    }
});

builder.Services.AddSingleton<IAuthorizationHandler, PermissionHandler>();

// 4. Dependency Injection
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContext, UserContext>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddHttpClient<IAIService, AIService>();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<IDeliveryService, DeliveryService>();
builder.Services.AddScoped<ISettingService, SettingService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

builder.Services.AddControllers();

// 5. Swagger Configuration with JWT Support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Company Management API", Version = "v1" });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token only."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "API is running").AllowAnonymous();

app.MapControllers();

// 6. Database Initialization & Seeding
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try 
    { 
        var context = services.GetRequiredService<AppDbContext>();
        
        // Ensure database exists
        context.Database.EnsureCreated();

        // Schema Patch: Add missing columns if they don't exist
        var dbConnection = context.Database.GetDbConnection();
        await dbConnection.OpenAsync();
        using (var command = dbConnection.CreateCommand())
        {
            // Add SKU if missing
            command.CommandText = "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'SKU') ALTER TABLE Products ADD SKU NVARCHAR(100) NULL;";
            await command.ExecuteNonQueryAsync();

            // Add Category if missing
            command.CommandText = "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'Category') ALTER TABLE Products ADD Category NVARCHAR(100) NULL;";
            await command.ExecuteNonQueryAsync();

            // Add ImageUrl if missing
            command.CommandText = "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'ImageUrl') ALTER TABLE Products ADD ImageUrl VARCHAR(MAX) NULL;";
            await command.ExecuteNonQueryAsync();

            // Add Currency if missing
            command.CommandText = "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Companies') AND name = 'Currency') ALTER TABLE Companies ADD Currency NVARCHAR(50) NULL;";
            await command.ExecuteNonQueryAsync();

            // Add Salary if missing
            command.CommandText = "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'Salary') ALTER TABLE Users ADD Salary DECIMAL(18,2) NULL;";
            await command.ExecuteNonQueryAsync();

            // Add Position if missing
            command.CommandText = "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'Position') ALTER TABLE Users ADD Position NVARCHAR(100) NULL;";
            await command.ExecuteNonQueryAsync();

            // Create Notifications table if missing
            command.CommandText = @"
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Notifications]') AND type in (N'U'))
                BEGIN
                    CREATE TABLE [Notifications] (
                        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                        [CompanyId] INT NOT NULL,
                        [UserId] INT NULL,
                        [Title] NVARCHAR(MAX) NOT NULL,
                        [Message] NVARCHAR(MAX) NOT NULL,
                        [Type] NVARCHAR(50) NULL,
                        [IsRead] BIT NOT NULL DEFAULT 0,
                        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
                        CONSTRAINT [FK_Notifications_Companies] FOREIGN KEY ([CompanyId]) REFERENCES [Companies] ([Id]),
                        CONSTRAINT [FK_Notifications_Users] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id])
                    );
                END";
            await command.ExecuteNonQueryAsync();

            // Create Attendances table if missing
            command.CommandText = @"
                IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Attendances]') AND type in (N'U'))
                BEGIN
                    CREATE TABLE [Attendances] (
                        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                        [UserId] INT NOT NULL,
                        [CompanyId] INT NOT NULL,
                        [Date] DATETIME2 NOT NULL,
                        [IsAbsent] BIT NOT NULL DEFAULT 0,
                        [DeductionAmount] DECIMAL(18,2) NOT NULL DEFAULT 0,
                        [Note] NVARCHAR(MAX) NULL,
                        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                        CONSTRAINT [FK_Attendances_Companies] FOREIGN KEY ([CompanyId]) REFERENCES [Companies] ([Id]),
                        CONSTRAINT [FK_Attendances_Users] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id])
                    );
                END";
            await command.ExecuteNonQueryAsync();
        }

        await DbSeeder.SeedAsync(context, services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while initializing the database.");
    }
}

app.Run();
