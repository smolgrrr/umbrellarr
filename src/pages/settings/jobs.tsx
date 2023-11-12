import SettingsJobs from '@app/components/Settings/SettingsJobsCache';
import SettingsLayout from '@app/components/Settings/SettingsLayout';
import type { NextPage } from 'next';

const SettingsMainPage: NextPage = () => {
  return (
    <SettingsLayout>
      <SettingsJobs />
    </SettingsLayout>
  );
};

export default SettingsMainPage;
