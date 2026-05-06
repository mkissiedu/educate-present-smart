import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, Upload, Check } from 'lucide-react';
import { offlineSyncManager } from '@/lib/offline-sync';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function SyncStatusIndicator() {
  const [isOnline, setIsOnline] = useState(offlineSyncManager.getOnlineStatus());
  const [pendingCount, setPendingCount] = useState(offlineSyncManager.getPendingUpdates().length);
  const [lastSync, setLastSync] = useState(offlineSyncManager.getLastSyncTime());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(offlineSyncManager.getOnlineStatus());
      setPendingCount(offlineSyncManager.getPendingUpdates().length);
      setLastSync(offlineSyncManager.getLastSyncTime());
    };

    const unsubscribe = offlineSyncManager.onSyncStatusChange(updateStatus);
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await offlineSyncManager.syncPendingUpdates();
    await offlineSyncManager.refreshCache();
    setIsSyncing(false);
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg shadow-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isOnline ? 'Connected to internet' : 'Working offline'}</p>
          </TooltipContent>
        </Tooltip>

        {pendingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Upload className="h-3 w-3" />
                {pendingCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{pendingCount} pending upload{pendingCount !== 1 ? 's' : ''}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {pendingCount === 0 && isOnline && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Check className="h-4 w-4 text-green-600" />
            </TooltipTrigger>
            <TooltipContent>
              <p>All changes synced</p>
            </TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualSync}
              disabled={!isOnline || isSyncing}
              className="h-8 px-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Last sync: {formatLastSync(lastSync)}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
