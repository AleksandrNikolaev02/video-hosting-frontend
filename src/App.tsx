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

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video" element={<Video />} />
        <Route path="/upload" element={<UploadVideo />} />
        <Route path="/create-channel" element={<CreateChannel />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/my-channel" element={<MyChannel />} />
        <Route path="/channel/:id" element={<ChannelPage />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/edit-video" element={<EditVideo />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App