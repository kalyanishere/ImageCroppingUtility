import { LightningElement,api } from 'lwc';

export default class Modalwindow extends LightningElement {
    @api showModal;

    handleUpload() {
        this.dispatchEvent(new CustomEvent('upload'));
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}