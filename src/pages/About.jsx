import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { useEffect, useState } from "react";

export default function About() {
  const currentUser = useAuthRedirect();
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    if (currentUser) {
      // Simulate data fetching/loading process
      setTimeout(() => {
        setLoading(false); // Stop loading after content is ready
      }, 1000); // Adjust the delay if needed
    }
  }, [currentUser]);

  // Show loading spinner if the page is still loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-600 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="about">
      <div className='bg-cover bg-center bg-[url(https://img.freepik.com/premium-photo/desk-artist-with-lots-stationery-objects_93675-34901.jpg?semt=ais_hybrid&w=740)] min-h-screen flex items-center justify-center px-4'>
        <div className='max-w-2xl mx-auto p-4 sm:p-6 text-center'>
          <div>
            <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center my-4 sm:my-7 bg-gradient-to-r text-transparent from-cyan-200 via-purple-500 to-gray-300 bg-clip-text shadow-lg'>
              About NexaHub
            </h1>
            <div className='text-sm sm:text-base md:text-lg text-white flex flex-col gap-4 sm:gap-6'>
              <p><i>
                At NexaHub, your ultimate destination for all things tech! At NexaHub, we're passionate about technology and committed to empowering individuals with the knowledge they need to thrive in the digital age.
              </i></p>
              <p><i>
                Our extensive collection of notes covers a wide array of tech topics, serving as a valuable resource for students, professionals, and enthusiasts alike.
              </i></p>
              <p><i>
                Our mission is clear: to bridge the gap between complexity and understanding in the realm of technology.
              </i></p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="features bg-gray-200 py-12 sm:py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">What We Offer?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="feature bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Notes Repository</h3>
              <p className="text-sm sm:text-base text-gray-700">Dive into our extensive collection of notes covering a wide range of tech subjects.</p>
            </div>
            <div className="feature bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Insightful Blog</h3>
              <p className="text-sm sm:text-base text-gray-700">Explore our blog section for valuable insights and perspectives on the latest trends in tech.</p>
            </div>
            <div className="feature bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">YouTube Channel</h3>
              <p className="text-sm sm:text-base text-gray-700">Engaging videos that bring tech concepts to life through multimedia content.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="features py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 dark:text-white text-center">JOIN US</h2>
        <div className="container mx-auto rounded-lg max-w-4xl">
          <p className="px-4 sm:px-8 md:px-12 lg:px-20 py-4 sm:py-6 dark:text-white text-sm sm:text-base md:text-lg text-center">
            Whether you're a student, a professional, or simply curious about the world of technology, we invite you to join our community at NexaHub. Explore our resources, participate in discussions, and embark on a journey of discovery and growth with us.
          </p>
        </div>
      </section>
    </div>
  );
}