
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BASE_URL,
  PATH_APPOINTMENT,
  PATH_PETOWNER,
  PATH_VETERIAN,
  PATH_VISIT,
  PATH_VACCINESCHEDULER,
  PATH_IMAGE,
  PATH_PET,
  PATH_VISITSCHEDULER,
  } from '../../utils/constants';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Grid,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@material-ui/core';

import { appointmentViewConfig } from '../../utils/display_configuration';
import makeApiCall from '../../utils/makeApiCall';
import MuiSelect from '../../components/select/select_index';
import MuiDatePicker from '../../components/date-picker/date-picker'
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
  table: {
    margin: '0 auto',
    width: '90%',
  },
  titleCell: {
    width: '35%',
    textAlign: 'right',
    borderBottom: 'none',
  },
  valueCell: {
    textAlign: 'left',
    borderBottom: 'none',
  },
  link: {
    color: theme.palette.secondary.main,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}));

const EditAppointmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const styles = useStyles();
    const [formData, setFormData] = useState({});
          const [errorData, setErrorData] = useState({});

  


  const [visits, setVisits] = useState([]);

  useEffect(() => {
    const fetchVisits = async () => {
      const typesResponse = await makeApiCall(
        `${BASE_URL}${PATH_VISIT}`
      );
      const jsonResp = await typesResponse.json();
      setVisits(jsonResp.value);
    };
    fetchVisits();
  }, []);

  useEffect(() => {
    const fetchAppointmentById = async () => {
      const appointmentResponse = await makeApiCall(
        `${BASE_URL}${PATH_APPOINTMENT}(${id})`
      );
      const jsonResp = await appointmentResponse.json();
      setFormData(jsonResp);
    };
    fetchAppointmentById();
  }, [id]);

  const handleChange = (key, value) => {
    setFormData({ ...formData, ...{ [key]: value } });
  };

  

  const submitForm = async () => {
      
    const { 
            Appointment_Id,
    ...otherData } = formData;

    

    

    const resp = await makeApiCall(
      `${BASE_URL}${PATH_APPOINTMENT}(${formData.Appointment_Id})`,
      'PATCH',
            JSON.stringify({
        ...otherData,
            Appointment_Id: parseInt(Appointment_Id),
      })
    );
    if (resp.ok) {
      snackbar.enqueueSnackbar('Successfully updated Appointment', {
        variant: 'success',
      });
      navigate({ pathname: '/appointments' });
    } else {
      const jsonData = await resp.json();
      snackbar.enqueueSnackbar(`Failed! - ${jsonData.message}`, {
        variant: 'error',
      });
    }
  };

  return (
    <Box padding={2}>
      <Grid>
        <Grid item lg={12} xs={12}>
          <Box display="flex" justifyContent="space-between">
            <Typography className="page-heading" variant="h5">
              Edit Appointment
            </Typography>
            <div className="action-buttons">
              <Button
                size="small"
                variant="contained"
                color="primary"
                className="margin-right"
                onClick={submitForm}
              >
                Save
              </Button>
              &nbsp;
              <Button
                size="small"
                variant="contained"
                color="secondary"
                onClick={() => navigate({ pathname: '/appointments' })}
              >
                Cancel
              </Button>
            </div>
          </Box>
        </Grid>
        <Divider />
        <Box marginTop={2} className="form-container">
          <Grid container item lg={12} xs={12}>
            {Object.keys(appointmentViewConfig)?.map((config, ind) => (
              <>
                <Grid item lg={5} md={5} xs={12}>
                  <Box marginTop={1}>
                    <Typography variant="h6">{config}</Typography>
                    <Table size="small" className={styles.table}>
                      <TableBody>
                        {appointmentViewConfig[config]?.map(
                          ({ key, value, type, required }) => (
                            <TableRow
                              key={key}
                              className="responsive-table-row"
                            >
                              <TableCell
                                className={[styles.titleCell, 'row-label'].join(
                                  ' '
                                )}
                              >
                                <Typography variant="body1">
                                  {value}
                                  {required ? '*' : ''}:
                                </Typography>
                              </TableCell>
                              <TableCell
                                className={[styles.valueCell, 'row-value'].join(
                                  ' '
                                )}
                              >
                                {key === 'Appointment_Id' ? (
                                  <Typography variant="body1">
                                    {formData[key]}
                                  </Typography>
                                ) : 
                                  key === 'AppointmentVisit' ? (
                                    <MuiSelect
                                      value={
                                        formData[key]
                                          ? visits.find(
                                              (e) =>
                                                e.Visit_id ===
                                                formData[key]
                                            )
                                          : ''
                                      }
                                      options={visits}
                                      error={errorData[key]}
                                      helperText={errorData[key]}
                                      valueKey=""
                                      handleChange={(e) =>
                                        handleChange(
                                          key,
                                          e.target.value.Visit_id
                                        )
                                      }
                                    />
                                  ) : 
                                type === 'date' ? (
                                  <MuiDatePicker
                                      name="Date Picker"
                                      value={formData[key] ? moment.utc(formData[key]).format("YYYY-MM-DDTHH:mm:ss") : ''}
                                      handleChange={(e) => {
                                        handleChange(key, moment.utc(e.target.value).format(
                                          "YYYY-MM-DDTHH:mm:ss[Z]"
                                        ))
                                      }}
                                      error={errorData}
                                    />
                                ) : type === 'boolean' ? (
                                  <Checkbox
                                    checked={formData[key] || false}
                                    onChange={(e) =>
                                      handleChange(key, e.target.checked)
                                    }
                                  />
                                ) :  (
                                  <>
                                    <TextField
                                      name={key}
                                      fullWidth
                                      className="text-field-custom"
                                      variant="outlined"
                                      size="small"
                                      type={type}
                                      error={errorData[key]}
                                      helperText={errorData[key]}
                                      value={formData[key] || ''}
                                      onChange={(e) => {
                                        if (e.target.reportValidity()) {
                                          handleChange(key, e.target.value);
                                        }
                                      }}
                                    />
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                </Grid>
                <Grid item lg={1} md={1} xs={false} />
              </>
            ))}
          </Grid>
        </Box>
      </Grid>
    </Box>
  );
};

export default EditAppointmentForm;
