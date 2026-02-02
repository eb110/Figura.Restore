using Figura.Restore.API.Data;
using Figura.Restore.API.Middleware;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddDbContext<StoreContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddCors();
builder.Services.AddTransient<ExceptionMiddleware>();

//middleware -> send / receive http response / request
var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

app.UseCors(opt =>
{
    //opt.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin();
    opt.AllowAnyHeader().AllowAnyMethod().WithOrigins("https://localhost:3000");
});

app.MapControllers();

//db seed
DbInitializer.InitDb(app);

app.Run();