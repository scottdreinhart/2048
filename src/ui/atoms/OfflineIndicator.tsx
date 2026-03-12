import { useOnlineStatus } from '@/app'

import styles from './OfflineIndicator.module.css'

export function OfflineIndicator() {
  const online = useOnlineStatus()
  if (online) {
    return null
  }
  return <div className={styles.banner}>You are offline — game continues locally</div>
}
