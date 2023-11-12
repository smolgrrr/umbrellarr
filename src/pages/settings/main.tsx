import SettingsLayout from '@app/components/Settings/SettingsLayout';
import SettingsMain from '@app/components/Settings/SettingsMain';
import type { NextPage } from 'next';

const SettingsMainPage: NextPage = () => {
  return (
    <SettingsLayout>
      <SettingsMain />
    </SettingsLayout>
  );
};

export default SettingsMainPage;
