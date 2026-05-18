import { useEffect, useState, useCallback } from 'react';
import { Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { getActivities } from '../services/dashboardService';
import { getErrorMessage, formatStatus } from '../utils/helpers';
import { formatDistanceToNow } from 'date-fns';

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getActivities({ page, limit: 20 });
      setActivities(res.data.data.activities);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity Logs</h1>
        <p className="text-gray-500">Track all system activities</p>
      </div>

      <div className="card !p-0">
        {loading ? (
          <div className="flex h-48 items-center justify-center"><LoadingSpinner /></div>
        ) : activities.length === 0 ? (
          <EmptyState icon={Activity} title="No activities yet" />
        ) : (
          <>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {activities.map((a) => (
                <div key={a._id} className="flex items-start gap-4 px-6 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                    {a.user?.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{a.description}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {a.user?.name} · {formatStatus(a.entityType)} · {a.action} ·{' '}
                      {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default ActivitiesPage;
