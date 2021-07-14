import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View,TouchableOpacity,TextInput ,Image, Alert,KeyboardAvoidingView,ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner} from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component{
    constructor(){
        super();

        this.state={
          hasCameraPermissions:null,
          scanned:false,
          scannedBookId:'',
          scannedStudentId:'',
          buttonState:'normal',
          transactionMessage:''
}
    }


    hasHandleBarCodeScanned=async({type,data})=>{
        const {buttonState}=this.state
        if(buttonState==="BookId"){
            this.setState({
                scanned:true,
                scannedBookId:data,
                buttonState:'normal'
               
            })
        }
        else if(buttonState==="StudentId"){
            this.setState({
                scanned:true,
                scannedStudentId:data,
                buttonState:'normal'
               
            })
        }

    }
    getCameraPermissions=async(id)=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
            hasCameraPermissions:status==="granted",
            scanned:false,
            buttonState:id,
           
        })
    }
    initiateBookIssue=async()=>{
        db.collection("transaction").add({
            'studentID':this.state.scannedStudentId,
            'bookID':this.state.scannedBookId,
            'transactionType':"Issue",
            'dateOfTransaction': firebase.firestore.Timestamp.now().toDate()
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailable':false,
            
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
        })
        Alert.alert('book Issued');
        this.setState({
            scannedBookId:'',
            scannedStudentId:'',
        })
    }
    initiateBookReturn=async()=>{
        db.collection("transaction").add({
            'studentID':this.state.scannedStudentId,
            'bookID':this.state.scannedBookId,
            'transactionType':"Return",
            'dateOfTransaction': firebase.firestore.Timestamp.now().toDate()
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailable':true,
            
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
        })
        Alert.alert('book Returned');
        this.setState({
            scannedBookId:'',
            scannedStudentId:'',
        })
    }

    handleTransaction=async()=>{
        var transactionType=await this.checkBookEligibility();
        if(!transactionType){
           alert("this book does not exist in the library");
           this.setState({
               scannedBookId:'',
               scannedStudentId:'',
           })
        }
           else if(transactionType==="Issue"){
             var isStudentEligible=await this.checkStudentEligibilityForBookIssue();
             if(isStudentEligible){
                 this.initiateBookIssue();
                 alert("book issue to the student");
                 }
           }
           else{
               var isStudentEligible=await this.checkStudentEligibilityForBookReturn();
               if(isStudentEligible){
                   this.initiateBookReturn();
                   alert("book returned to the library");
               }
        }
          }
          checkStudentEligibilityForBookIssue=async()=>{
              const studentRef=await db.collection("students").where("studentID","==",this.state.scannedStudentId).get()
              var isStudentEligible=""
              if(studentRef.docs.length===0){
                  alert("this student doesnt exist in the database");
                  isStudentEligible=false;

                  this.setState({
                      scannedBookId:'',
                      scannedStudentId:'',
                  })
            }
            else{
                studentRef.docs.map((doc)=>{
                    var student=doc.data();
                    if(student.numberOfBooksIssued<2){
                        isStudentEligible=true;
                    }
                    else{
                        isStudentEligible=false;
                        alert("student already issued 2 books")

                        this.setState({
                            scannedStudentId:'',
                            scannedBookId:'',
                        })
                    }
                })
            }

         return isStudentEligible;
             
          }
          checkStudentEligibilityForBookReturn=async()=>{
           const transactionRef=await db.collection('transaction').where("bookID","==",this.state.scannedBookId).limit(1).get()
           var isStudentEligible=""
           transactionRef.docs.map((doc)=>{
               var lastBookTransaction=doc.data();
               if(lastBookTransaction.studentID===this.state.studentID){
                   isStudentEligible=true;
               }
               else{
                   isStudentEligible=false;
                   alert("this student issue the book")

                   this.setState({
                       scannedBookId:'',
                       scannedStudentId:'',
                   })
               }
           })
           return isStudentEligible;
          }

          checkBookEligibility=async()=>{
           const bookRef=await db.collection('books').where("bookID","==",this.state.scannedBookId).get()
           var transactionType=""
           if(bookRef.docs.length===0){
               transactionType=false;
           }
           else{
               bookRef.docs.map((doc)=>{
                   var book=doc.data();
                   if(book.bookAvailable){
                       transactionType="Issue"
                   }
                   else{
                       transactionType="return"
                   }
               })
               
           }
           return transactionType;
          }

        render(){
            const hasCameraPermissions=this.state.hasCameraPermissions;
         const scanned=this.state.scanned;
         const buttonState=this.state.buttonState;
         if(buttonState!=="normal" && hasCameraPermissions){
             return(
                 <BarCodeScanner
                  onBarCodeScanned={
                      scanned? undefined : this.hasHandleBarCodeScanned
                  }
                  style={StyleSheet.absoluteFillObject}
                 >

                 </BarCodeScanner>
             )
         }
         else if(buttonState==="normal"){

        return(

            <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                <View>
                    <Image style={{width:200,height:200}}
                    source={require('../assets/booklogo.jpg')}></Image>
                    <Text style={{textAlign:'center',fontSize:30}}>Wily</Text>
                </View>
           <View style={styles.inputView}>
               <TextInput styles={styles.inputBox}
                          placeholder="book Id"
                          value={this.state.scannedBookId}
                          onChangeText={text=>{
                              this.setState({
                                  scannedBookId:text,
                              })
                          }}>
              
                          </TextInput>
               <TouchableOpacity style={styles.scanButton }
                                 onPress={()=>{this.getCameraPermissions("BookId")}} >
                   <Text style={styles.buttonText}>Scan</Text>
               </TouchableOpacity>
           </View>

           <View style={styles.inputView}>
               <TextInput styles={styles.inputBox}
                          placeholder="student Id"
                          value={this.state.scannedStudentId}
                          onChangeText={text=>{
                              this.setState({
                                  scannedStudentId:text,
                              })
                          }}>

                          </TextInput>
               <TouchableOpacity style={styles.scanButton}
                                 onPress={()=>{this.getCameraPermissions("StudentId")}}>
                   <Text style={styles.buttonText}>Scan</Text>
               </TouchableOpacity>
           </View>
          
               <TouchableOpacity style={styles.submitbutton}
                                 onPress={async()=>{
                                     var transactionMessage=this.handleTransaction()
                                     this.setState({
                                         scannedStudentId:'',
                                         scannedBookId:'',
                                     })
                                 }}>
                   <Text style={styles.submitbuttontext}>Submit</Text>
               </TouchableOpacity>
        
            </KeyboardAvoidingView>

        )
            }
    }
}

const styles=StyleSheet.create({
    container:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
    },
    button:{
        backgroundColor:'yellow',
        margin:10,
        padding:10,
    },
    displaytext:{
        fontSize:20,
        textDecorationLine:'underline',
    },
    buttonText:{
        fontSize:15,
        textAlign:'center',
        marginTop:10,

    },
    inputView:{
        flexDirection:'row',
        margin:20,
    },
    inputBox:{
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20,
    },
   scanButton:{
       backgroundColor:'yellow',
       width:50,
       borderWidth:1.5,
       borderLeftWidth:0,
   },
   submitbutton:{
       backgroundColor:'red',
       width:100,
       height:50,
   },
   submitbuttontext:{
       textAlign:'center',
       padding:10,
       fontSize:20,
       color:'white',
       fontWeight:'bold',
   },
})