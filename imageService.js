var redis = require('redis');
var client = redis.createClient();

client.on('error', function(err){
  console.log('Something went wrong ', err)
});

client.set(id, value, redis.print);
client.get(id, function(error, result) {
  if (error) throw error;
  console.log('GET result ->', result)
});
