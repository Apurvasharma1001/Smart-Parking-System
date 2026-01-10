const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const CardSkeleton = () => (
    <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div className="h-8 w-8 bg-slate-200 rounded"></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="h-16 bg-slate-200 rounded-lg"></div>
        <div className="h-16 bg-slate-200 rounded-lg"></div>
      </div>
      <div className="h-10 bg-slate-200 rounded w-full"></div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-slate-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
            <div className="h-8 w-20 bg-slate-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const MapSkeleton = () => (
    <div className="bg-slate-200 rounded-lg animate-pulse" style={{ height: '500px' }}>
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-400">Loading map...</div>
      </div>
    </div>
  );

  switch (type) {
    case 'card':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(count)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      );
    case 'list':
      return <ListSkeleton />;
    case 'map':
      return <MapSkeleton />;
    default:
      return <CardSkeleton />;
  }
};

export default LoadingSkeleton;
