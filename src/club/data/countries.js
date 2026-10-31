// Approximate label locations, not territorial boundaries. Flag artwork is
// bundled from flag-icons; country outlines come from Natural Earth.
export const COUNTRIES = Object.freeze([
  ['sg', 'SGP', 'Singapore', 'Asia', 103.82, 1.35, 'Red and white, with a white crescent and five white stars.'],
  ['jp', 'JPN', 'Japan', 'Asia', 138, 37, 'A white flag with one red circle.'],
  ['cn', 'CHN', 'China', 'Asia', 104, 35, 'Red, with one large and four small yellow stars.'],
  ['in', 'IND', 'India', 'Asia', 79, 23, 'Saffron, white and green stripes, with a blue wheel.'],
  ['id', 'IDN', 'Indonesia', 'Asia', 118, -3, 'Two stripes: red above white.'],
  ['my', 'MYS', 'Malaysia', 'Asia', 102, 4, 'Red and white stripes, with a yellow crescent and star on blue.'],
  ['th', 'THA', 'Thailand', 'Asia', 101, 15, 'Red, white, blue, white and red horizontal stripes.'],
  ['vn', 'VNM', 'Vietnam', 'Asia', 107, 16, 'Red with one yellow star in the centre.'],
  ['kr', 'KOR', 'South Korea', 'Asia', 128, 36, 'White with a red and blue circle and four black trigrams.'],
  ['fr', 'FRA', 'France', 'Europe', 2, 47, 'Three vertical stripes: blue, white and red.'],
  ['de', 'DEU', 'Germany', 'Europe', 10, 51, 'Three horizontal stripes: black, red and gold.'],
  ['it', 'ITA', 'Italy', 'Europe', 12, 43, 'Three vertical stripes: green, white and red.'],
  ['gb', 'GBR', 'United Kingdom', 'Europe', -2, 54, 'Red and white crosses on a blue background.'],
  ['us', 'USA', 'United States', 'North America', -101, 39, 'Red and white stripes, with white stars on blue.'],
  ['ca', 'CAN', 'Canada', 'North America', -106, 57, 'Red side panels and a red maple leaf on white.'],
  ['br', 'BRA', 'Brazil', 'South America', -52, -12, 'Green with a yellow diamond and a blue globe.'],
  ['au', 'AUS', 'Australia', 'Oceania', 134, -25, 'Blue, with the Union Jack and white stars, including a large seven-pointed star.'],
  ['nz', 'NZL', 'New Zealand', 'Oceania', 173, -41, 'Blue, with the Union Jack and four red stars edged in white.'],
  ['za', 'ZAF', 'South Africa', 'Africa', 25, -29, 'A green Y shape, with red, blue, black, white and yellow.'],
  ['eg', 'EGY', 'Egypt', 'Africa', 30, 27, 'Red, white and black stripes, with a golden eagle in the middle.'],
].map(([id, mapId, name, continent, lon, lat, description]) => Object.freeze({ id, mapId, name, continent, lon, lat, description })));

export const COUNTRY_BY_ID = Object.freeze(Object.fromEntries(COUNTRIES.map(country => [country.id, country])));
export const project = (lon, lat) => [(lon + 180) * 2, (85 - lat) * 2];
