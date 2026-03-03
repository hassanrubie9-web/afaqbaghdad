import ForecastForm from '@/components/forms/ForecastForm';

export default function ForecastPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white">التوقعات</h1>
        <p className="text-white/60">
          توقعات عربية بأسلوب علمي-إنساني: سيناريوهات احتمالية + نصائح عملية.
        </p>
      </div>
      <ForecastForm />
    </div>
  );
}
