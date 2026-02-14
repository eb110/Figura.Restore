using Figura.Restore.API.Data;
using Figura.Restore.API.Entities;
using Figura.Restore.API.Middleware;
using Figura.Restore.API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddDbContext<StoreContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddCors();
builder.Services.AddTransient<ExceptionMiddleware>();
//scoped payment service => triggers for individual request when controller calls it
builder.Services.AddScoped<PaymentsService>();

//ef identity
builder.Services.AddIdentityApiEndpoints<User>(opt =>
{
    //just as an example
    opt.User.RequireUniqueEmail = true;
})
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<StoreContext>();


//middleware -> send / receive http response / request
var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

app.UseCors(opt =>
{
    //opt.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin();
    opt.AllowAnyHeader().AllowAnyMethod().AllowCredentials().WithOrigins("https://localhost:3000");
});

//login / register
app.UseAuthentication();
//Roles / access
app.UseAuthorization();

app.MapControllers();

//EF identity => gives all of the EF Identity ready made endpoints
app.MapGroup("api").MapIdentityApi<User>(); //api/login

//db seed
//this will also run db migration update if needed!!!
//we don't have to run this command by ourself -> build of the service will trigger it
DbInitializer.InitDb(app);

app.Run();