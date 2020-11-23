public with sharing class FileUploadController {
    public class FileContents {
        public String PathOnClient;
        public String Title;
        public Blob VersionData;
    }

    @AuraEnabled
    public static boolean uploadFiles(List<Map<String, Object>> files){
        Boolean isSuccess = false;
        List<ContentVersion> filesToUpload = new List<ContentVersion>();
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
            Database.saveResult[] srFiles = Database.insert(filesToUpload);
            for (Database.SaveResult saveResult : srFiles) {
                isSuccess = saveResult.isSuccess();
            }
            
        }catch(Exception e){
            throw e;
        }
        return isSuccess;
    }
}
