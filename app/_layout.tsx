// Updated _layout.tsx — all providers wired up
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { PermissionsProvider } from '../contexts/PermissionsContext';
import { CompanyProvider } from '../contexts/CompanyContext';
import { AuditProvider } from '../contexts/AuditContext';
import { CustomersProvider } from '../contexts/CustomersContext';
import { InventoryProvider } from '../contexts/InventoryContext';
import { SalesProvider } from '../contexts/SalesContext';
import { PurchasesProvider } from '../contexts/PurchasesContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <LanguageProvider>
            <PermissionsProvider>
              <CompanyProvider>
                <AuditProvider>
                  <CustomersProvider>
                    <InventoryProvider>
                      <SalesProvider>
                        <PurchasesProvider>
                          <Stack screenOptions={{ headerShown: false }} />
                        </PurchasesProvider>
                      </SalesProvider>
                    </InventoryProvider>
                  </CustomersProvider>
                </AuditProvider>
              </CompanyProvider>
            </PermissionsProvider>
          </LanguageProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
