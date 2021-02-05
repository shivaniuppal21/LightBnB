const { Pool } = require('pg');
const properties = require('./json/properties.json');
const users = require('./json/users.json');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  const queryString = `SELECT * FROM users WHERE email = $1;`
  return pool.query(queryString,[email])
  .then((data) => data.rows[0])
  .catch(() => {
    return null;
  });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const queryString = `SELECT * FROM users WHERE id = $1`
  return pool.query(queryString, [id])
  .then(data => data.rows[0])
    .catch(() => {
    return null;
  });
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const queryString = `INSERT INTO users(name, password, email) values($1, $2, $3) RETURNING *`
  return pool.query(queryString, [user.name, user.password, user.email])
  .then(data => 
    data.rows[0])
    .catch(() => {
    return null;
  });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  const queryString = `SELECT properties.*, reservations.*, AVG(property_reviews.rating) AS "average_rating"
  FROM properties 
  JOIN reservations ON properties.id = reservations.property_id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  AND reservations.end_date < now()::date
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT $2;`
  return pool.query(queryString, [guest_id, limit]).then(data => 
    data.rows)
    .catch(() => {
    return null;
  });
};

exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  const queryParams = [];
  console.log(options.minimum_rating)
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  if (options.city) {
    console.log("inside city")
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }
  if (options.owner_id) {
    queryParams.push(`%${options.owner_id}%`);
    if(queryParams.length > 0){
      queryString += ` AND owner_id LIKE $${queryParams.length} `;
    }else{
      queryString += `WHERE owner_id LIKE $${queryParams.length} `;
    }
  }
  if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night}`);
    if(queryParams.length > 0){
      queryString += `AND cost_per_night/100 > $${queryParams.length} `;
    }else{
      queryString += `WHERE cost_per_night/100 > $${queryParams.length} `;
    }
  }
  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night}`);
    if(queryParams.length > 0){
      queryString += `AND cost_per_night/100 < $${queryParams.length} `;
    }
    else{
      queryString += `WHERE cost_per_night/100 < $${queryParams.length} `;
    }
  }
  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    if(queryParams.length > 0){
      queryString += `AND rating > $${queryParams.length} `;

    }
    else{
      queryString += `WHERE rating > $${queryParams.length} `;

    }
  }

  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  return pool.query(queryString,queryParams)
.then(res => res.rows);
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const queryString = `INSERT INTO properties(owner_id, title, description, thumbnail_photo_url,cover_photo_url, cost_per_night, street, city, province,post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms) values($1, $2, $3, $4, $5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`
  return pool.query(queryString, [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms])
  .then(data => 
    data.rows[0])
    .catch(() => {
    return null;
  });
};

exports.addProperty = addProperty;
