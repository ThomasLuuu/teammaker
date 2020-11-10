//To make sure the security, I created a file which contains the db URL aslo known as Database URL

dbPassword ='mongodb+srv://user:'+encodeURIComponent('user')+'@cluster0-m3rir.mongodb.net/test?retryWrites=true&w=majority';
module.exports = {
    mongoURI: dbPassword
};
