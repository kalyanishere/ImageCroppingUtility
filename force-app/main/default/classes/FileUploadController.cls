public with sharing class FileUploadController {
    public class FileContents {
        public String PathOnClient;
        public String Title;
        public Blob VersionData;
    }

    @AuraEnabled
    public static boolean uploadFiles(String recordId,List<Map<String, Object>> files){
        Boolean isSuccess = false;
        List<ContentVersion> filesToUpload = new List<ContentVersion>();
        List<ContentDocumentLink> linkedFiles = new List<ContentDocumentLink>();
        try{
            for (Map<String, Object> file : files) {
                String fileJson = JSON.serialize(file);
                FileContents fileContent = (FileContents) JSON.deserialize(fileJson, FileContents.class);
                ContentVersion contentVersionFile = new ContentVersion();
                contentVersionFile.PathOnClient = fileContent.PathOnClient;
                contentVersionFile.Title = fileContent.Title;
                contentVersionFile.VersionData = fileContent.VersionData;
                filesToUpload.add(contentVersionFile);
            }
            insert filesToUpload;
            List<Id> cvIds = new List<Id>();

            for(ContentVersion cv : filesToUpload){
                cvIds.add(cv.id);
            }
            if(String.isNotBlank(recordId)){
                for (ContentVersion cv : [SELECT ID,ContentDocumentId FROM ContentVersion WHERE Id IN :cvIds]) {
                    ContentDocumentLink cdl = new ContentDocumentLink();
                        cdl.ContentDocumentId=cv.ContentDocumentId;
                        cdl.LinkedEntityId=recordId;
                        cdl.ShareType = 'V';
                        linkedFiles.add(cdl);

                }

                insert linkedFiles;
            }

            isSuccess=true;
            
        }catch(Exception e){
            throw e;
        }
        return isSuccess;
    }
}
