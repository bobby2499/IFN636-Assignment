import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Attractions from './pages/Attractions';
import AttractionDetail from './pages/AttractionDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAttractions from './pages/admin/AdminAttractions';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReviews from './pages/admin/AdminReviews';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Attractions />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/attractions" element={<Attractions />} />
        <Route path="/attractions/:id" element={<AttractionDetail />} />
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/attractions" element={<AdminAttractions />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
      </Routes>
    </Router>
  );
}

export default App;
