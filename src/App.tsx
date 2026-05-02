import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import Video from './pages/Video'
import UploadVideo from './pages/UploadVideo';
import CreateChannel from './pages/CreateChannel';
import SearchPage from './pages/SearchPage';
import Header from './pages/Header';
import MyChannel from './pages/MyChannel';
import ChannelPage from './pages/Channel';
import Subscriptions from './pages/Subscriptions';
import EditVideo from './pages/EditVideo';
import Login from './pages/Login';
import { PrivateRoute } from './component/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video" element={<Video />} />
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <UploadVideo />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-channel"
          element={
            <PrivateRoute>
              <CreateChannel />
            </PrivateRoute>
          }
        />
        <Route path="/search" element={<SearchPage />} />
        <Route
          path="/my-channel"
          element={
            <PrivateRoute>
              <MyChannel />
            </PrivateRoute>
          }
        />
        <Route path="/channel/:id" element={<ChannelPage />} />
        <Route
          path="/subscriptions"
          element={
            <PrivateRoute>
              <Subscriptions />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-video"
          element={
            <PrivateRoute>
              <EditVideo />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App