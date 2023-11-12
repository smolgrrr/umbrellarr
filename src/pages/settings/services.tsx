import SettingsLayout from '@app/components/Settings/SettingsLayout';
import SettingsServices from '@app/components/Settings/SettingsServices';
import type { NextPage } from 'next';

const ServicesSettingsPage: NextPage = () => {
  return (
    <SettingsLayout>
      <SettingsServices />
    </SettingsLayout>
  );
};

export default ServicesSettingsPage;
