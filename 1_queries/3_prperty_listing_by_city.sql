SELECT
  properties.*,
  avg(property_reviews.rating)
FROM
  properties
  JOIN property_reviews ON properties.id = property_id
WHERE
  city like '%ncou%'
GROUP BY
  properties.id
HAVING
  avg(property_reviews.rating) >= 4
ORDER BY
  cost_per_night
LIMIT
  10