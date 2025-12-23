import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddEditPatientForm from "./AddEditPatientForm";
import EncounterList from "./encounter/EncounterList";

function PatientTabsWrapper() {
  return (
    <>
      <Tabs defaultValue="patient" className="bg-white p-4 rounded">
        <TabsList className="bg-white">
          <TabsTrigger className="text-gray-600" value="patient">
            Patient
          </TabsTrigger>
          <TabsTrigger className="text-gray-600" value="encounter">
            Encounter
          </TabsTrigger>
        </TabsList>
        <TabsContent value="patient">
          <AddEditPatientForm />
        </TabsContent>
        <TabsContent value="encounter">
          <EncounterList />
        </TabsContent>
      </Tabs>
    </>
  );
}

export default PatientTabsWrapper;
