// Static gender avatar: SAME image for every male account, SAME for every female.
export default function Avatar({ gender, size = 'w-14 h-14' }) {
  const female = gender === 'FEMALE';
  return (
    <img
      src={female ? '/avatars/female.svg' : '/avatars/male.svg'}
      alt={female ? 'Female avatar' : 'Male avatar'}
      className={`${size} rounded-full object-cover shrink-0 border border-white/10 bg-white/5`}
      draggable={false}
    />
  );
}
