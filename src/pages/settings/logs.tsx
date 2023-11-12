import SettingsLayout from '@app/components/Settings/SettingsLayout';
import SettingsLogs from '@app/components/Settings/SettingsLogs';
import type { NextPage } from 'next';

const SettingsLogsPage: NextPage = () => {
  return (
    <SettingsLayout>
      <SettingsLogs />
    </SettingsLayout>
  );
};

export default SettingsLogsPage;
