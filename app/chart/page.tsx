import BirthChartForm from '@/components/forms/BirthChartForm';

export default function ChartPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white">خريطة الميلاد</h1>
        <p className="text-white/60">
          احصل على خريطة ميلادك (الكواكب، البيوت، الطالع، الجوانب) مع عرض دائري قابل للطباعة.
        </p>
      </div>

      <BirthChartForm />
    </div>
  );
}
