import { redirect } from 'next/navigation';

// 이 라우트는 폐기됨 (채팅방 개념 제거).
// 옛 링크로 들어온 사용자는 댓글 리스트로 보낸다.
export default function DeprecatedChatRoom() {
  redirect('/comments');
}
