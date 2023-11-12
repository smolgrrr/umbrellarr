import SettingsLayout from '@app/components/Settings/SettingsLayout';
import SettingsMain from '@app/components/Settings/SettingsMain';
import type { NextPage } from 'next';

const SettingsPage: NextPage = () => {
  return (
    <SettingsLayout>
      <SettingsMain />
    </SettingsLayout>
  );
};

export default SettingsPage;
