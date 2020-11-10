Assignment 3 - Build a full stack website

GROUP 10
	
Student name: Luu Duy Toan 
Student ID: S3777213
Distribution: Creating database and building Back-end of this Website Application

Student name:Chau Huy Hoang	
Student ID: S3777258
Distribution: Building front-end of this Website Application

In this website I use the function called passportjs, which can reinforce the website security. 
Moreover, for every function of this website, users have to login to check “authentication” to complete tasks
on the website such as edit students’ projects and delete students’ projects. All of the functions on this website require login process. 
In this assignment I create a file called “env” to store the MongoDB Atlas URL also known as the URL to the my database, 
when I want to get the link to the database, I will call it out instead of showing it at the main file.
In case someone crash my code, they can’t steal my database. In case hackers can leak my database,
they can’t get the users passwords because all of the passwords are hashed with bcrypt, 
so these passwords will completely convert into a line of code. They can do nothing with it.

I created an admin account : 
Email: admin1@rmit.edu.vn 
Password: admin123

Demo Clip URL : https://www.youtube.com/watch?v=5G9eqs91c_E

##### SET-UP PROCESS #######

1. npm install

2.npm start or node app.js