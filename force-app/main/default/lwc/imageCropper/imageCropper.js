import { LightningElement, track,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import uploadFiles from '@salesforce/apex/FileUploadController.uploadFiles';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import cropper from '@salesforce/resourceUrl/cropper';
import bootstrap from '@salesforce/resourceUrl/bootstrap';
import fontawesome from '@salesforce/resourceUrl/fontawesome';
import staticImage from '@salesforce/resourceUrl/ImageTest';

export default class ImageCropper extends LightningElement {

    defaultImageUrl = staticImage;
    cropper='';
    @track showModal = false;
    result;
    resultdata;
    originalImageURL;
    uploadedImageType = 'image/jpeg';
    uploadedImageName = 'Cropped.jpg';
    uploadedImageURL;
    imageQuality=0.8;
    imageSize = '2';


    standardResolutions = { '6': ['4096', '4096'], '5': ['1920', '1080'], '4': ['1280', '720'], '3': ['1024', '768'], '2': ['640', '480'], '1': ['320', '240'] };

    get ImageType() {
        return [
            { label: 'JPEG', value: 'image/jpeg' },
            { label: 'PNG', value: 'image/png' },
        ]
    }
    get ImageOptions() {
        return [
            { label: '4096*4096', value: '6' },
            { label: '1920*1080', value: '5' },
            { label: '1280*720', value: '4' },
            { label: '1024*768', value: '3' },
            { label: '640*480', value: '2' },
            { label: '320*240', value: '1' }
        ];
    };

    connectedCallback() {
        Promise.all([
            loadScript(this, cropper + '/dist/cropper.js'),
            loadStyle(this, cropper + '/dist/cropper.css'),
            loadStyle(this, cropper + '/dist/main.css'),
            loadStyle(this, bootstrap + '/bootstrap-4.3.1-dist/css/bootstrap.css'),
            //loadScript(this, bootstrap + '/bootstrap-4.3.1-dist/js/bootstrap.js'),
            loadStyle(this, fontawesome + '/css/all.css'),
        ])
            .then(() => {
                this.initImageCropper();

            })
            .catch(error => {
                this.showToastMessage('Error loading Cropper Libraries', 'Error', 'Error');
            });
    };

    initImageCropper() {

        let container = this.template.querySelector('.img-container');
        let image = container.getElementsByTagName('img').item(0);
        let inp=this.template.querySelectorAll("lightning-input");    
        let options = {
            ready: function (e) {
                console.log(e.type);
            },
            crop: function (e) {
                var data = e.detail;

                inp.forEach(function(element){
                        switch(element.name){
                            case 'x':
                                element.value=Math.round(data.x);
                            break;
                            
                            case 'y':
                                element.value=Math.round(data.y);
                            break;
            
                            case 'w':
                                element.value=Math.round(data.width);
                            break;
            
                            case 'h':
                                element.value=Math.round(data.height);
                            break;
            
                            case 'r':
                                element.value=Math.round(data.rotate);
                            break;
                        }
                    },this);
            }
        };

        this.cropper = new Cropper(image, options);
        this.originalImageURL = image.src;
        
    };

    doAction(event){
        let target = event.target || event.srcElement;
        let data;
        
        while (target !== this) {
            if (target.getAttribute('data-method')) {
                break;
            }

            target = target.parentNode;
        }

        if (target === this || target.disabled || target.className.indexOf('disabled') > -1) {
            return;
        }

        data = {
            method: target.getAttribute('data-method'),
            option: target.getAttribute('data-option') || undefined,
            secondOption: target.getAttribute('data-second-option') || undefined
        };
        
       
        switch (data.method) {
            
            case 'move':
                this.cropper.move(data.option,data.secondOption);
            break;

            case 'rotate':
                this.cropper.rotate(data.option);
            break;

            case 'zoom':
                this.cropper.zoom(data.option);
            break;

            case 'flip':
                if(data.secondOption=='x'){
                    this.cropper.scaleX(data.option);
                }
                if(data.secondOption=='y'){
                    this.cropper.scaleY(data.option);
                }
                target.setAttribute('data-option',-data.option);   
            break;

            case 'crop':
                this.cropper.crop();
            break;

            case 'destroy':
                this.cropper.destroy();
                //this.cropper = new Cropper(this.defaultImageUrl);
            break;

            case 'reset':
                this.cropper.reset();
            break;

            case 'clear':
                this.cropper.clear();
            break;

            case 'getCroppedCanvas':
                this.openPreview(data.option,data.secondOption);
            break;

            case 'fileUpload':

                    let files = target.files;
                    let file;
            
                    if (files && files.length) {
                        file = files[0];
                        if (/^image\/\w+/.test(file.type)) {
                            this.uploadedImageType = file.type;
                            this.uploadedImageName = file.name;
                            
                            if (this.uploadedImageURL != null) {
                                URL.revokeObjectURL(this.uploadedImageURL);
                            }
                            
                            let reader = new FileReader();
                            reader.onload = e => {
                                console.log(e);
                                
                                this.uploadedImageURL=reader.result;
                            };
                            reader.readAsDataURL(file);

                            reader.onloadend = e => {
                             
                                this.uploadedImageURL = reader.result;
                                let imagetarget =this.template.querySelector('.img-container').getElementsByTagName('img').item(0);
                                imagetarget.setAttribute('src',this.uploadedImageURL)
                                if (this.cropper) {
                                    this.cropper.destroy();
                                }
                                  
                                this.cropper = new Cropper(imagetarget);
                                
                            }
                        } else {
                            alert('Please choose an image file.');
                        }
                            
                    };
            break;

            case 'advConfig':
                let inp=this.template.querySelectorAll("lightning-input"); 
                let datax;
                let datay;
                let datah;
                let dataw;
                let datar;
                inp.forEach(function(element){
                        switch(element.name){
                            case 'x':
                                datax=element.value;
                            break;
                            
                            case 'y':
                                datay=element.value;
                            break;
            
                            case 'w':
                                dataw=element.value;
                            break;
            
                            case 'h':
                                datah=element.value;
                            break;
            
                            case 'r':
                                datar=element.value;
                            break;
                        }
                    },this);

                let dataparams={
                    "x": Math.round(datax),
                    "y": Math.round(datay),
                    "width": Math.round(dataw),
                    "height": Math.round(datah),
                    "rotate": Math.round(datar)
                }
                alert(JSON.stringify(dataparams));
                this.cropper.setData(dataparams);
                this.cropper.crop();
                
            break;

        }
    };

    updateImageQuality(event){
        this.imageQuality=event.target.value;
    }

    handlePixelChange(event){

        this.imageSize=event.detail.value;
    }

    changeImageType(event){

        this.uploadedImageType=event.target.value;
    }

    openPreview(w,h) {
        let size=this.standardResolutions[this.imageSize];
        let result=this.cropper.getCroppedCanvas({width:size[0],height:size[1],fillcolor:'#fff'}); 
        this.resultdata=result.toDataURL(this.uploadedImageType,this.imageQuality);
        //this.template.querySelector('.modal-body').innerHTML='';
        //this.template.querySelector('.modal-body').appendChild(result); 
        this.showModal = true;          
    };

    closeModal() {
        // to close modal set isModalOpen  value as false
        this.showModal = false;
    };

    async uploadFiles() {
        
            //alert('Parent '+this.resultdata);
            let filesUploaded = [];
            let base64 = 'base64,';
            let content = this.resultdata.indexOf(base64) + base64.length;
            let fileContents = this.resultdata.substring(content);         
            filesUploaded.push({PathOnClient: this.uploadedImageName, Title: this.uploadedImageName, VersionData: fileContents});
            
            await uploadFiles({files:filesUploaded}).then(res=>{
                this.showToastMessage('Cropped Image Uploaded Successfully',res,'Success');
            }).catch(error=>{
                this.showToastMessage('Unable to upload image',error.message,'Error');
            });
        //this.showToastMessage('Success','Files Uploaded Successfully','Success');
        this.showModal = false;
    };

    showToastMessage(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    };

}