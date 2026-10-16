import { useParams } from 'react-router-dom';
import ChatLayout from '../components/ChatLayout.jsx';

export default function ChatWindow() {
  const { id } = useParams();
  return <ChatLayout selectedId={id} />;
}
