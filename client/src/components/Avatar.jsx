// Static gender avatar: SAME image for every male account, SAME for every female.
// Purple → mustard gradient ring; green dot = online.
export default function Avatar({ gender, size = 'w-14 h-14', online = false }) {
  const female = gender === 'FEMALE';
  return (
    <span className="relative shrink-0 inline-block p-[2px] rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-400 to-amber-300">
      <img
        src={female ? '/avatars/male.svg' : '/avatars/female.svg'}
        alt={female ? 'Female avatar' : 'Male avatar'}
        className={`${size} rounded-full object-cover bg-white/5 block`}
        draggable={false}
      />
      {online && (
        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0a0a0b] shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
      )}
    </span>
  );
}
