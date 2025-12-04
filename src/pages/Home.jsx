import React, { useEffect, useState } from "react";
import { useAuthRedirect } from '../hooks/useAuthRedirect';
//import img1 from './img1.png';

function Home() {
  const currentUser = useAuthRedirect();
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    if (currentUser) {
      // Simulate a short delay for checking authentication or fetching data
      setTimeout(() => {
        setLoading(false); // Stop loading after checking auth
      }, 1000); // Adjust the delay as needed
    }
  }, [currentUser]);

  // If still loading, show a loading spinner in the center of the screen
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-600 border-solid"></div>
      </div>
    );
  }

  // Main content to be displayed once loading is complete
  return (
    <div>
      <div className="bg-[url('https://wallpapercave.com/wp/wp10523141.png')] bg-cover bg-center min-h-screen">
        <section className="hero py-12 sm:py-16 md:py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <i>Welcome to NexaHub</i>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-700">
              <i>Explore the world of the Notes.</i>
            </p>
          </div>
        </section>
        <section className="hero py-12 sm:py-16 md:py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Learn Anything, Anytime, Anywhere
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-4">
              <i>
                User-friendly platform allows you to effortlessly upload, organize, and access your notes from anywhere, at any time.
              </i>
            </p>
            <p className="text-sm sm:text-base md:text-lg text-gray-700">
              <i>
                Say goodbye🚀 to scattered papers and endless searching—NexaHub keeps your notes securely stored and easily retrievable. With a wide range of features including tagging, categorization, and collaboration options, managing your notes has never been simpler. Join our community of note-takers today and elevate your productivity to new heights with NexaHub! 🌈
              </i>
            </p>
          </div>
        </section>
      </div>

      <section className="features bg-gray-200 py-12 sm:py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">Why Choose Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="feature bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">
                Wide Range of PDF'S Files
              </h3>
              <p className="text-sm sm:text-base text-gray-700">
                Choose from thousands of pdf files covering various subjects from beginner to advanced levels.
              </p>
            </div>
            <div className="feature bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Flexible Learning</h3>
              <p className="text-sm sm:text-base text-gray-700">
                Learn at your own pace with lifetime access to course materials and videos.
              </p>
            </div>
            <div className="feature bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">
                Teacher-Powered Blog
              </h3>
              <p className="text-sm sm:text-base text-gray-700">
                Teachers can share valuable insights, tutorials, and updates on various tech stacks and industry trends. Students can explore and learn from expert-curated content.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;