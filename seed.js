const { sequelize } = require('./config/database');
const User = require('./models/User');
const Movie = require('./models/Movie');
const Review = require('./models/Review');

const seedData = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Create sample users
    const users = await User.bulkCreate([
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123'
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password123'
      },
      {
        username: 'movie_lover',
        email: 'movie@example.com',
        password: 'password123'
      }
    ]);

    console.log('Sample users created');

    // Create sample movies
    const movies = await Movie.bulkCreate([
      {
        title: 'The Shawshank Redemption',
        description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        genre: 'Drama',
        releaseDate: '1994-09-23',
        director: 'Frank Darabont',
        duration: 142
      },
      {
        title: 'The Godfather',
        description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        genre: 'Crime',
        releaseDate: '1972-03-24',
        director: 'Francis Ford Coppola',
        duration: 175
      },
      {
        title: 'Pulp Fiction',
        description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
        genre: 'Crime',
        releaseDate: '1994-10-14',
        director: 'Quentin Tarantino',
        duration: 154
      },
      {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
        genre: 'Sci-Fi',
        releaseDate: '2010-07-16',
        director: 'Christopher Nolan',
        duration: 148
      },
      {
        title: 'The Dark Knight',
        description: 'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and DA Harvey Dent.',
        genre: 'Action',
        releaseDate: '2008-07-18',
        director: 'Christopher Nolan',
        duration: 152
      }
    ]);

    console.log('Sample movies created');

    // Create sample reviews
    const reviews = await Review.bulkCreate([
      { userId: 1, movieId: 1, rating: 5, comment: 'Absolutely masterpiece! One of the best films ever made.' },
      { userId: 2, movieId: 1, rating: 5, comment: 'Incredible storytelling and character development.' },
      { userId: 3, movieId: 1, rating: 4, comment: 'Great movie, but a bit slow at times.' },
      
      { userId: 1, movieId: 2, rating: 5, comment: 'The Godfather is a timeless classic. Brando\'s performance is legendary.' },
      { userId: 2, movieId: 2, rating: 4, comment: 'Excellent film, though quite long.' },
      
      { userId: 1, movieId: 3, rating: 4, comment: 'Tarantino at his finest. Non-linear storytelling done perfectly.' },
      { userId: 3, movieId: 3, rating: 5, comment: 'Love the dialogue and the unique structure.' },
      
      { userId: 2, movieId: 4, rating: 5, comment: 'Mind-bending and visually stunning. Nolan is a genius.' },
      { userId: 3, movieId: 4, rating: 4, comment: 'Great concept but can be confusing.' },
      
      { userId: 1, movieId: 5, rating: 5, comment: 'Best superhero movie ever made. Heath Ledger\'s Joker is unforgettable.' },
      { userId: 2, movieId: 5, rating: 5, comment: 'Dark, gritty, and absolutely brilliant.' },
      { userId: 3, movieId: 5, rating: 4, comment: 'Excellent action and storytelling.' }
    ]);

    console.log('Sample reviews created');

    // Update movie ratings
    for (const movie of movies) {
      const movieReviews = reviews.filter(r => r.movieId === movie.id);
      const averageRating = movieReviews.reduce((sum, r) => sum + r.rating, 0) / movieReviews.length;
      
      await movie.update({
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalReviews: movieReviews.length
      });
    }

    console.log('Movie ratings updated');
    console.log('Sample data seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await sequelize.close();
  }
};

seedData();