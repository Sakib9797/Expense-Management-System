
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-purple">
      <Header 
        showBackButton 
        onBack={() => navigate('/')}
      />
      
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">About Us</h1>
          
          <p className="mb-4 text-lg">
            We are a platform dedicated to bringing people together through shared interests and goals. Our group system allows users to create, join, and participate in various communities.
          </p>
          
          <p className="mb-4 text-lg">
            Whether you're looking to learn a new skill, share your knowledge, or simply connect with like-minded individuals, our platform provides the tools and space to do so effectively.
          </p>
          
          <p className="mb-8 text-lg">
            Join us today and become part of our growing community of passionate individuals!
          </p>
          
          <h2 className="text-2xl font-bold mb-4">Our Features</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-purple-700">Group Creation</h3>
              <p>Create your own groups based on shared interests, projects, or goals</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-purple-700">Easy Joining</h3>
              <p>Join existing groups with a simple code or search functionality</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-purple-700">Expense Tracking</h3>
              <p>Create and manage expense profiles within your groups</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-purple-700">Group Management</h3>
              <p>View group details and members with intuitive interfaces</p>
            </div>
          </div>
          
          <p className="text-center text-gray-600 italic">
            Our mission is to make group collaboration and expense management simple and effective.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
